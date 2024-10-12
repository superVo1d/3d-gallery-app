import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  @Input() label: string | undefined = undefined; // Text on the button
  @Input() type: 'button' | 'submit' | 'reset' = 'button'; // Button type
  @Input() disabled = false; // Disabled state of the button
  @Input() styleClass = ''; // CSS classes for custom styles

  @Output() btnClick = new EventEmitter<Event>(); // Emits event on button click

  @ViewChild('button') button!: ElementRef<HTMLButtonElement>;

  onClick(event: Event) {
    if (!this.disabled) {
      this.btnClick.emit(event); // Emit the click event to the parent
    }
  }

  getButtonElement(): HTMLButtonElement {
    return this.button.nativeElement;
  }
}
