import { Component, OnInit, Input, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { faRProject } from '@fortawesome/free-brands-svg-icons';
import { faMinusSquare, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../../services/api.service';
import { ConnectionService } from '../../services/connection.service';
import { BillsComponent } from '../bills/bills.component'
declare var $:any;

@Component({
  selector: 'tr [app-bill-table]',
  templateUrl: './bill-table.component.html',
  styleUrls: ['./bill-table.component.css']
})
export class BillTableComponent implements OnInit {

  constructor(
    private api: ApiService,
    private BillsComponent: BillsComponent,
    private renderer: Renderer2,
    private connectionService: ConnectionService
  ) { }

  public hasConnection(): boolean {
    return this.connectionService.hasConnection;
  }

  hasDeleteMessage: boolean = false;
  deleteMessage: string = "";
  
  hasEditMessage: boolean = false;
  editMessage: string = "";

  ngOnInit(): void {
  }

  @ViewChild('editBillPayee') editBillPayee: ElementRef;
  @ViewChild('editBillAmount') editBillAmount: ElementRef;
  @ViewChild('editBillDate') editBillDate: ElementRef;
  @ViewChild('editBillModal') editBillModal: ElementRef;
  

  faMinusSquare = faMinusSquare;
  faPencilAlt = faPencilAlt

  @Input()
  data = {
    "_id": "",
    "year": "",
    "month": 0,
    "monthName": "",
    "day": "",
    "category": "",
    "recipient": "",
    "value": 0,
    "currency": "",
    "repeat": ""
  }

  @Input()
  Currency: string

  @Input()
  Categories = {
    "color": "",
    "basic": true,
    "_id": "",
    "name": ""
  }

  nameEditBills(): number {
    const field = this.editBillPayee.nativeElement;
    var regex = new RegExp("^[ A-Za-z0-9_@./#&+-: ]{1,20}$");
    //črkev male,velike,številke
    if (!field.value.match(regex)) {
        field.style.setProperty("border-color", "red", "important");
        $(field.id).toast('show');
        return 0;
    } else {
        field.style.borderColor = "#ced4da";
        $(field.id).toast('hide');
        return 1;
    }
  }

  amountEditBills(): number {
    const field = this.editBillAmount.nativeElement;
    var regex = new RegExp("^[0-9]+(\.[0-9]{1,2})?$");
    //decimalna števila z največj 2ma decimalnima mestoma ločilo je pika!
    //črkev male,velike,številke ne veljajo števila kot so .73, 
    if (!field.value.match(regex)) {
        field.style.setProperty("border-color", "red", "important");
        $(field.id).toast('show');
        return 0;
    } else {
        field.style.borderColor = "#ced4da";
        $(field.id).toast('hide');
        return 1;
    }
  }

  dateEditBills(): number {
    const field = this.editBillDate.nativeElement;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    var inputDate = field.value.split("-");

    if (inputDate[0] > yyyy) {
        $(field.id).toast('hide');
        field.style.borderColor = "#ced4da";
        return 1;
    } else if (inputDate[0] == yyyy) {
        if (inputDate[1] > mm) {
            $(field.id).toast('hide');
            field.style.borderColor = "#ced4da";
            return 1;
        } else if (inputDate[1] == mm) {
            /* 
            ? IF DAY IS >= NOW */
            if (inputDate[2] >= dd) {
                $(field.id).toast('hide');
                field.style.borderColor = "#ced4da";
                return 1;
            } else {
                $(field.id).toast('show');
                field.style.setProperty("border-color", "red", "important");
                return 0;
            }
        } else {
            $(field.id).toast('show');
            field.style.setProperty("border-color", "red", "important");
            return 0;
        }
    } else {
        $(field.id).toast('show');
        field.style.setProperty("border-color", "red", "important");
        return 0;
    }
  }

  buttonEditBills(categoryValue: string, payeeValue: string, amountValue: number, dateValue: Date, repeatValue: String) {
    var amount1 = this.amountEditBills();
    var check1 = this.nameEditBills();
    var date1 = this.dateEditBills();
    if (amount1 == 0 || check1 == 0 || date1 == 0) {
      //DO NOTHING
    } else {
      this.editBill(categoryValue, payeeValue, amountValue, dateValue, repeatValue);
    }
  }

  editBill(category, payee, amount, date, repeat){
    this.hasEditMessage = true;
    this.editMessage = "Saving bill";

    this.api.editBill(this.data._id, category, payee, amount, date, repeat).then((response) => {
      this.editBillModal.nativeElement.click();
      this.BillsComponent.afterEdit(response);
      this.hasEditMessage = false;
    }).catch((error) => {
      this.editMessage = "Failed to save";
    });
  }

  buttonDeleteBill(): void {
    if (!this.data._id) {
        //DO NOTHING
    } else {
       this.deleteBill();
    }
  }

  deleteBill(){
    let decision = confirm("Are you sure you want to delete bill " + this.data.recipient + "?");
    if (decision == true) {
      this.hasDeleteMessage = true;
      this.deleteMessage = "Deleting bill";

      this.api.deleteBill(this.data._id).then((response) => {
        this.BillsComponent.afterDelete(this.data._id)
        this.hasDeleteMessage = false;
      }).catch((error) => {
        this.deleteMessage = "Failed to delete!"
      });
    }
  }


  

  
  

}
