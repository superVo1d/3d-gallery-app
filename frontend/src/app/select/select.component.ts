import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
})
export class SelectComponent {
  @Input() options: string[] = [];
  @Input() name: string | undefined;

  // Output event to notify the parent of the selected option
  @Output() selectionChange = new EventEmitter<string>();

  selectedOption: string | null = null;

  // Handle selection
  selectOption(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;

    this.selectedOption = selectElement.value;
    this.selectionChange.emit(selectElement.value); // Emit the selected option
  }
}
