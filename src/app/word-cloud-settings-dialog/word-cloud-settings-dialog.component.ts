import { Component, Inject } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSliderModule } from "@angular/material/slider";
import { MatSelectModule } from "@angular/material/select";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import {
  MAT_COLOR_FORMATS,
  NGX_MAT_COLOR_FORMATS,
  NgxMatColorPickerModule,
} from "@angular-material-components/color-picker";
import { MatInputModule } from "@angular/material/input";

export const CUSTOM_MAT_COLOR_FORMATS = {
  display: {
    colorInput: "hex",
  },
};

export interface Settings {
  fontSize: number;
  fontType: string;
  colorScheme: string;
  singleColor: string;
  backgroundColor: string;
}
@Component({
  selector: "app-word-cloud-settings-dialog",
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSliderModule,
    MatSelectModule,
    MatInputModule,
    NgxMatColorPickerModule,
  ],
  templateUrl: "./word-cloud-settings-dialog.component.html",
  styleUrl: "./word-cloud-settings-dialog.component.css",
  providers: [
    { provide: MAT_COLOR_FORMATS, useValue: CUSTOM_MAT_COLOR_FORMATS },
  ],
})
export class WordCloudSettingsDialogComponent {
  fontSize: number;
  fontType: string;
  colorScheme: string;
  singleColor?: string;
  backgroundColor: string;

  constructor(
    public dialogRef: MatDialogRef<WordCloudSettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Settings
  ) {
    this.fontSize = data?.fontSize;
    this.fontType = data?.fontType;
    this.colorScheme = data?.colorScheme;
    this.backgroundColor = data?.backgroundColor;
  }
  onSave(): void {
    this.dialogRef.close({
      fontSize: this.fontSize,
      fontType: this.fontType,
      colorScheme: this.colorScheme,
      singleColor:
        this.colorScheme === "single-color" ? this.singleColor : undefined,
      backgroundColor: this.backgroundColor,
    });
  }
  onClose(): void {
    this.dialogRef.close();
  }
}
