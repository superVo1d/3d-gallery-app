import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ApiService } from '../services/api.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AnimationType } from '../three-viewer/three-viewer.component';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent implements OnChanges {
  @Output() fileSelected = new EventEmitter<File | null>();
  @Output() animationType = new EventEmitter<AnimationType>();
  @Output() modelUploadSuccess = new EventEmitter();

  isDragging = false;
  isSelected = false;
  selectedFile?: File = undefined;

  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;
  @ViewChild('authorInput') authorInput!: ElementRef<HTMLInputElement>;
  @ViewChild('animationInput') animationInput!: ElementRef<HTMLSelectElement>;
  @ViewChild('submitButton') submitButton!: ElementRef<HTMLButtonElement>;

  @Input() name = '';
  @Input() author = '';
  @Input() animation: string | undefined = 'orbit';

  form = new FormGroup({
    name: new FormControl('', Validators.required),
    author: new FormControl('', Validators.required),
    animation: new FormControl('', Validators.required),
  });

  constructor(private apiService: ApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['name'] &&
      changes['name'].currentValue !== this.form.get('name')?.value
    ) {
      this.form.get('name')?.setValue(this.name);
    }
    if (
      changes['author'] &&
      changes['author'].currentValue !== this.form.get('author')?.value
    ) {
      this.form.get('author')?.setValue(this.author);
    }
    if (
      changes['animation'] &&
      changes['animation'].currentValue !== this.form.get('animation')?.value &&
      this.animation
    ) {
      this.form.get('animation')?.setValue(this.animation);
    }
  }

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
      input.value = '';
    } else {
      this.fileSelected.emit(null);
    }
  }

  handleFiles(fileList: FileList) {
    this.isSelected = true;
    this.fileSelected.emit(fileList[0]);
    this.selectedFile = fileList[0];
  }

  deselectFile() {
    this.isSelected = false;
    this.selectedFile = undefined;
    this.fileSelected.emit(null);
  }

  onChangeAnimationType(type: string) {
    this.animationType.emit(type as AnimationType);
  }

  get isSubmitDisabled(): boolean {
    return this.form.invalid || !this.selectedFile; // disable if form is invalid or no file is selected
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    // Focus author input if name input is active
    if (document.activeElement === this.nameInput.nativeElement) {
      event.preventDefault();
      this.authorInput.nativeElement.focus();
    }
    // Focus submit button if author input is active
    else if (document.activeElement === this.authorInput.nativeElement) {
      event.preventDefault();
      this.submitButton.nativeElement.focus();
    }
  }

  onSubmit() {
    const name = this.form.get('name')?.value;
    const author = this.form.get('author')?.value;
    const animation = this.form.get('animation')?.value;

    if (this.selectedFile && name && author) {
      this.apiService
        .uploadModel(
          name,
          author,
          animation as AnimationType,
          this.selectedFile
        )
        .subscribe({
          next: () => {
            console.log('Upload successful');
            this.modelUploadSuccess.emit();
            this.isSelected = false;
            this.selectedFile = undefined;
            this.fileSelected.emit(null);
            this.name = '';
          },
          error: () => console.error('Upload failed'),
        });
    }
  }
}
