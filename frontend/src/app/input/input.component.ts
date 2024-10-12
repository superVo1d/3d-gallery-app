/* eslint-disable @typescript-eslint/no-empty-function */
import {
  Component,
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  value = '';

  @Input() placeholder = '';

  @ViewChild('inputRef') inputRef!: ElementRef<HTMLInputElement>;

  // Callbacks for ControlValueAccessor
  onChange = (value: string) => {};
  onTouched = () => {};

  updateValue(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.value = inputElement.value;
    this.onChange(this.value);
    this.onTouched();
  }

  // ControlValueAccessor interface methods
  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Handle disabled state if necessary
  }

  @HostListener('click')
  onComponentClick() {
    this.inputRef.nativeElement.focus(); // Focus the input element when the component is clicked
  }

  getInputElement(): HTMLInputElement {
    return this.inputRef.nativeElement;
  }
}
