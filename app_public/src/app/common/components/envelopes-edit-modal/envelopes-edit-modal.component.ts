import { Component, OnInit, Input, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { ApiService } from '../../services/api.service';
declare var $:any;

@Component({
  selector: 'app-envelopes-edit-modal',
  templateUrl: './envelopes-edit-modal.component.html',
  styleUrls: ['./envelopes-edit-modal.component.css']
})


export class EnvelopesEditModalComponent implements OnInit {

  @Input()
  Envelope = {
    "_id":"",
    "progress":0,
    "budget":0,
    "spent":0,
    "colorHex":"",
    "color":"",
    "bgColor":"",
    "month":"",
    "category":{
      "_id":"",
      "color":"",
      "basic":true,
      "name":"",
      "__v":0
    }
  }

  @Input()
  Currency: string

  hasEditEnvelopeMessage: boolean = false;
  editEnvelopeMessage: string = "";

  constructor(
    private renderer: Renderer2,
    private api: ApiService
    ) { }

  @ViewChild('amountEdit') amountEdit: ElementRef;
  @ViewChild('editEnvelopeModal') editEnvelopeModal: ElementRef;
  

  ngOnInit(): void {
  }

  editEnvelopes() {
    this.hasEditEnvelopeMessage = true;
    this.editEnvelopeMessage = "Saving changes";    

    this.api.editEnvelope(
      
      this.Envelope._id,
      this.amountEdit.nativeElement.value
      ).then(result => {
        this.editEnvelopeModal.nativeElement.click();
        this.Envelope.budget = this.amountEdit.nativeElement.value;
        this.hasEditEnvelopeMessage = false;
       }).catch(error => {
        this.editEnvelopeMessage = "Failed saving changes!";    
       });
  }

  amountEditEnvelopes() {

    const field = this.amountEdit.nativeElement;
    //var field = document.getElementById("PayeeModal");
    var regex = new RegExp("^[0-9]+(\.[0-9]{1,2})?$");
    //decimalna števila z največj 2ma decimalnima mestoma ločilo je pika!
    //črkev male,velike,številke ne veljajo števila kot so .73, 
    if (!field.value.match(regex)) {

        field.style.setProperty("border-color", "red", "important");
        $(field.id).toast('show')
        return 0;

    } else {

        field.style.borderColor = "#ced4da";
        $(field.id).toast('hide')
        return 1;
        
    }
  }

  buttonEditEnvelopes(): void{

    var amount = this.amountEditEnvelopes();

    if (amount == 0) {

        //DO NOTHING

    } else {
      this.editEnvelopes()
    }
  }
}
