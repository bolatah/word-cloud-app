import { Component, EventEmitter, Input, Output, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { WordCloud } from '../word-cloud.model';
import { Router } from '@angular/router';
import * as d3 from 'd3';

@Component({
  selector: 'app-word-cloud-card',
  standalone: true,
  imports: [],
  templateUrl: './word-cloud-card.component.html',
  styleUrl: './word-cloud-card.component.css',
})
export class WordCloudCardComponent implements AfterViewInit {
  @Input() wordCloud!: WordCloud;
  @ViewChild('cardElement' , {static : true}) cardElement!: ElementRef;

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    this.createCloudShape();
  }

  createCloudShape() {
    const width = 200;
    const height = 100;

    const card = this.cardElement.nativeElement;

    const svg = d3.select(card)
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    
    svg.selectAll('circle')
      .data([40, 30, 50, 20, 35]) 
      .enter().append('circle')
      .attr('cx', (d, i) => 40 + i * 30)  
      .attr('cy', height / 2)              
      .attr('r', d => d)                  
      .style('fill', '#fff')               
      .style('opacity', 0.7);          

      svg.append('text')
      .attr('x', width / 2)       
      .attr('y', height / 2 - 10) 
      .attr('text-anchor', 'middle') 
      .style('fill', '#333')     
      .style('font-size', '14px') 
      .text(this.wordCloud.name);
    
    svg.append('text')
      .attr('x', width / 2)       
      .attr('y', height / 2 + 10) 
      .attr('text-anchor', 'middle') 
      .style('fill', '#555') 
      .style('font-size', '12px') 
      .text(this.wordCloud.category);
    
  }

  onCardClick(id: number): void {
    this.router.navigate([`/word-clouds/${id}`]);
  }
}
