import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-cb-user',
  templateUrl: './cb-user.component.html',
  styleUrls: ['./cb-user.component.css']
})
export class CbUserComponent implements OnInit {

  @Input("selectedUser") selectedItem: number | null = null; // ID del proprietario selezionato
  @Output("selectedItemChange") selectedItemChange: EventEmitter<number> = new EventEmitter<number>();
  userList: User[] = [];   

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    // Carica la lista degli utenti al momento dell'inizializzazione
    this.userList = this.userService.getUserList();
  }

  // Gestisce la selezione dell'utente dal menu a tendina
  onSelected(event: any): void {
    const selectedId = event.target.value ? parseInt(event.target.value, 10) : null;
    this.selectedItem = selectedId;

    // Emetti il valore selezionato o -1 se non è valido
    this.selectedItemChange.emit(this.selectedItem ?? -1);
  }
}
