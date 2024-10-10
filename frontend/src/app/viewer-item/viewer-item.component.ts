import { Component } from '@angular/core';

@Component({
  selector: 'app-viewer-item',
  templateUrl: './viewer-item.component.html',
  styleUrls: ['./viewer-item.component.scss'],
})
export class ViewerItemComponent {
  selectedFile: File | null = null;

  onFileSelected(file: File | null): void {
    this.selectedFile = file; // Update the selected file
  }
}
