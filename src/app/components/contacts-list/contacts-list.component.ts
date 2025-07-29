// contacts-list.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-contacts-list',
  template: `<div>Contacts List Works!</div>`, // Temporary template
  standalone: true
})
export class ContactsListComponent {
  @Input() contacts: any[] = [];
  @Output() contactSelected = new EventEmitter<any>();
}