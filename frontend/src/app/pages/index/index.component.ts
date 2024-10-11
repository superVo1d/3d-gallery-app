import { Component, OnInit } from '@angular/core';
import { ApiService, Model } from 'src/app/services/api.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent implements OnInit {
  items: Model[] = [];
  loading = true;
  errorMessage: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getModels().subscribe({
      next: (data: Model[]) => {
        this.items = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching items:', error);
        this.errorMessage = 'Failed to load items';
        this.loading = false;
      },
    });
  }
}
