import { Component, Input } from '@angular/core';
import { AnimationType } from '../three-viewer/three-viewer.component';

@Component({
  selector: 'app-viewer-item',
  templateUrl: './viewer-item.component.html',
  styleUrls: ['./viewer-item.component.scss'],
})
export class ViewerItemComponent {
  selectedFile: File | null = null;
  // animationType: AnimationType | undefined = undefined;

  @Input() name = ''; // URL input
  @Input() author = ''; // URL input
  @Input() modelUrl: string | null = null; // URL input
  @Input() animationType: AnimationType | undefined; // URL input

  onFileSelected(file: File | null): void {
    this.selectedFile = file; // Update the selected file
  }

  onAnimationTypeChange(type: AnimationType) {
    this.animationType = type;
  }
}
