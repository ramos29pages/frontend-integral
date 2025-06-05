import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav *ngIf="totalPages > 1" class="flex justify-center items-center space-x-2 my-4">
      <button
        (click)="goToPage(currentPage - 1)"
        [disabled]="currentPage === 1"
        class="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        Anterior
      </button>
      <ng-container *ngFor="let page of pages">
        <button
          *ngIf="page !== '...'"
          (click)="goToPage(page)"
          [ngClass]="{
            'px-3 py-1 border rounded-md font-bold': true,
            'bg-blue-600 text-white': page === currentPage,
            'bg-white text-gray-700 border-gray-300 hover:bg-gray-50': page !== currentPage
          }"
        >
          {{ page }}
        </button>
        <span *ngIf="page === '...'" class="px-3 py-1">...</span>
      </ng-container>
      <button
        (click)="goToPage(currentPage + 1)"
        [disabled]="currentPage === totalPages"
        class="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        Siguiente
      </button>
    </nav>
  `,
  styles: []
})
export class PaginationComponent implements OnChanges {
  @Input() totalPages: number = 1;
  @Input() currentPage: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  pages: (number | string)[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalPages'] || changes['currentPage']) {
      this.generatePageNumbers();
    }
  }

  generatePageNumbers(): void {
    this.pages = [];
    const maxPagesToShow = 5; // e.g., 2 at start, 1 middle, 2 at end, or just around current

    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        this.pages.push(i);
      }
    } else {
      // Logic for showing ellipsis
      if (this.currentPage <= 3) {
        for (let i = 1; i <= maxPagesToShow - 2; i++) {
          this.pages.push(i);
        }
        this.pages.push('...');
        this.pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        this.pages.push(1);
        this.pages.push('...');
        for (let i = this.totalPages - (maxPagesToShow - 3); i <= this.totalPages; i++) {
          this.pages.push(i);
        }
      } else {
        this.pages.push(1);
        this.pages.push('...');
        this.pages.push(this.currentPage - 1);
        this.pages.push(this.currentPage);
        this.pages.push(this.currentPage + 1);
        this.pages.push('...');
        this.pages.push(this.totalPages);
      }
    }
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}
