import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent {
  @Output() fileSelected = new EventEmitter<File | null>();

  isDragging = false;
  isSelected = false;
  selectedFile?: File = undefined;

  @Input() name = '';
  @Input() author = '';

  constructor(private apiService: ApiService) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files.length) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(input.files);
    } else {
      this.fileSelected.emit(null);
    }
  }

  handleFiles(fileList: FileList) {
    this.isSelected = true;
    this.fileSelected.emit(fileList[0]);
    this.selectedFile = fileList[0];
  }

  onSubmit() {
    if (this.selectedFile && this.name && this.author) {
      this.apiService
        .uploadModel(this.name, this.author, this.selectedFile)
        .subscribe({
          next: () => console.log('Upload successful'),
          error: () => console.error('Upload failed'),
        });
    }
  }
}
