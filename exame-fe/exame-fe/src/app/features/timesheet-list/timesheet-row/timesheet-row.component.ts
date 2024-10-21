import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TimeSheetDTO } from '../../../core/models/timesheet.model';


@Component({
  selector: 'app-timesheet-row',
  templateUrl: './timesheet-row.component.html',
  styleUrls: ['./timesheet-row.component.css']
})
export class TimesheetRowComponent {
  @Input() timesheet!: TimeSheetDTO; // Riceve il timesheet come input
  @Output() timesheetSelected = new EventEmitter<TimeSheetDTO>();

  // Metodo per gestire la selezione di un timesheet
  selectTimesheet(): void {
    this.timesheetSelected.emit(this.timesheet);
  }
}