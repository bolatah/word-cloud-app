import { TestBed } from '@angular/core/testing';
import { WordCloud } from './word-cloud.model';
import { WordCloudService } from './word-cloud.service';

// Mock Electron
const mockElectron = {
  ipcRenderer: {
    on: jest.fn(),
    send: jest.fn(),
    invoke: jest.fn(),
  },
};

describe('WordCloudService', () => {
  let service: WordCloudService;
  const mockClouds: WordCloud[] = [
    {
      id: 1,
      name: 'Sample Cloud 1',
      category: 'Category 1',
      words: ['word1', 'word2'],
    },
    {
      id: 2,
      name: 'Sample Cloud 2',
      category: 'Category 2',
      words: ['word3', 'word4'],
    },
  ];

  // Mock the Electron API
  beforeAll(() => {
    (window as any).electron = {
      initializeDatabase: jest.fn().mockResolvedValue(undefined),
      getClouds: jest.fn().mockResolvedValue(
        mockClouds.map((cloud) => ({
          id: cloud.id,
          name: cloud.name,
          category: cloud.category,
          words: JSON.stringify(cloud.words),
        }))
      ),
      addCloud: jest.fn().mockResolvedValue(undefined),
      updateCloud: jest.fn().mockResolvedValue(undefined),
      deleteCloud: jest.fn().mockResolvedValue(undefined),
    };
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WordCloudService,
        { provide: 'Electron', useValue: mockElectron }, // Provide the mock
      ],
    });
    service = TestBed.inject(WordCloudService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize the database and load clouds', (done) => {
    service.getWordClouds().subscribe((clouds) => {
      expect(clouds).toEqual(mockClouds);
      done();
    });
  });

  it('should add a new cloud and update the cloudsSubject', (done) => {
    const newCloud = {
      name: 'New Cloud',
      category: 'New Category',
      words: ['wordA', 'wordB'],
    };

    service
      .addCloud(newCloud.name, newCloud.category, newCloud.words)
      .subscribe({
        next: () => {
          expect(window.electron.addCloud).toHaveBeenCalledWith(
            newCloud.name,
            newCloud.category,
            newCloud.words
          );
          service.getWordClouds().subscribe((clouds) => {
            expect(clouds).toContainEqual(expect.objectContaining(newCloud));
            done();
          });
        },
        error: done.fail,
      });
  });

  it('should delete a cloud and update the cloudsSubject', (done) => {
    const deleteId = mockClouds[0].id;

    service.deleteCloud(deleteId).subscribe({
      next: () => {
        expect(window.electron.deleteCloud).toHaveBeenCalledWith(deleteId);
        service.getWordClouds().subscribe((clouds) => {
          expect(clouds.find((cloud) => cloud.id === deleteId)).toBeUndefined();
          done();
        });
      },
      error: done.fail,
    });
  });

  it('should update an existing cloud and update the cloudsSubject', (done) => {
    const updateId = mockClouds[0].id;
    const updatedData = {
      name: 'Updated Name',
      category: 'Updated Category',
      words: ['newWord'],
    };

    service
      .updateCloud(
        updateId,
        updatedData.name,
        updatedData.category,
        updatedData.words
      )
      .subscribe({
        next: () => {
          expect(window.electron.updateCloud).toHaveBeenCalledWith(
            updateId,
            updatedData.name,
            updatedData.words
          );
          service.getWordClouds().subscribe((clouds) => {
            const updatedCloud = clouds.find((cloud) => cloud.id === updateId);
            expect(updatedCloud?.name).toBe(updatedData.name);
            expect(updatedCloud?.category).toBe(updatedData.category);
            done();
          });
        },
        error: done.fail,
      });
  });

  it('should handle addCloud errors', (done) => {
    (window.electron.addCloud as jest.Mock).mockRejectedValueOnce(
      'Add Cloud Error'
    );

    service.addCloud('Error Cloud', 'Error Category', ['errorWord']).subscribe({
      error: (error) => {
        expect(error).toBe('Add Cloud Error');
        done();
      },
    });
  });
});
