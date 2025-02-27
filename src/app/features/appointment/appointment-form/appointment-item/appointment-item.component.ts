import { Component, EventEmitter, Input, Output } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { Appointment } from '../../../../core/models';

@Component({
  selector: 'app-appointment-item',
  imports: [MatIconModule, MatButtonModule, MatTooltipModule, DragDropModule],
  templateUrl: './appointment-item.component.html',
  styleUrls: ['./appointment-item.component.scss'],
})
export class AppointmentItemComponent {
  @Input() appointment!: Appointment;
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<Event>();

  get timeString(): string {
    const start = this.formatTime(this.appointment.startDate);
    const end = this.formatTime(this.appointment.endDate);
    return `${start} - ${end}`;
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  handleEdit(): void {
    this.edit.emit(this.appointment.id);
  }

  handleDelete(event: Event): void {
    this.delete.emit(event);
  }
}
