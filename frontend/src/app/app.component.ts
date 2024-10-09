import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  selectedFile: File | null = null;

  ngOnInit(): void {
    console.log('init');
  }

  onFileSelected(file: File | null): void {
    this.selectedFile = file; // Update the selected file
  }
}
