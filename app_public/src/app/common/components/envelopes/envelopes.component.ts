import { Component, OnInit, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../../services/api.service';
import { Card } from '../../classes/card';
import { Envelope } from '../../classes/envelope';
declare var $:any;

@Component({
  selector: 'app-envelopes',
  templateUrl: './envelopes.component.html',
  styleUrls: ['./envelopes.component.css']
})
export class EnvelopesComponent implements OnInit {

  constructor(
    private api: ApiService,
    private renderer: Renderer2,
    private router: Router) { }

  cards: Card[]
  public envelopes: Array<Envelope>;
  public categories: any;
  fileName = "envelopes";
  message = "Welcome to Envelopes!";
  welcomeMessage = "This is the best way to track your monthly and weekly spending per category. Start by clicking 'Add Envelope'.";
  logout = "Logout";
  year = new Date().getFullYear();
  month = new Date().getMonth() + 1;
  day = new Date().getDate();
  DASHBOARD = "DASHBOARD";
  GOALS = "GOALS";
  BILLS = "BILLS";
  HISTORY = "HISTORY";
  UTILITIES = "UTILITIES";
  user = "User";
  settings = "Settings";
  appearance = "Appearance";
  light = "Light";
  dark = "Dark";
  setMonthNumber = new Date().getMonth() + 1;
  setMonth = this.getCurrentMonth(new Date().getMonth());
  currentMonth = this.getCurrentMonth(new Date().getMonth());
  currency = "EUR";

  ngOnInit(): void {
    this.api.getUser().then(result => {
      this.cards = this.generateCards(result.envelopes);
      this.envelopes = result.envelopes;
      this.categories = this.getCategories(result.categories);
    }).catch(error => console.log(error));
  }

  @ViewChild('selectCategoryAdd') selectCategoryAdd: ElementRef;
  @ViewChild('categoryAdd') categoryAdd: ElementRef;
  @ViewChild('amountAdd') amountAdd: ElementRef;
  @ViewChild('colorAdd') colorAdd: ElementRef;
  @ViewChild('categoryExpense') categoryExpense: ElementRef;
  @ViewChild('nameExpense') nameExpense: ElementRef;
  @ViewChild('amountExpense') amountExpense: ElementRef;
  @ViewChild('dateExpense') dateExpense: ElementRef;

  faPlusSquare = faPlusSquare;

  addExpense(): void {     
    let newSpent = 0;
    let newProgress = 0;

    for (let envelope of this.envelopes) {
      let dateArr = this.dateExpense.nativeElement.value.split("-")

      if (envelope['category']['name'] === this.categoryExpense.nativeElement.value && dateArr[1] == this.setMonthNumber) {
        newSpent =  parseFloat(parseFloat(this.amountExpense.nativeElement.value).toFixed(2)) + envelope['spent'];
        envelope['spent'] = newSpent;
        newProgress = Math.round(envelope['spent'] / envelope['budget'] * 100);
        envelope['progress'] = newProgress;
      }
    }

    this.api.addExpense(
      this.amountExpense.nativeElement.value,
      this.categoryExpense.nativeElement.value,
      this.nameExpense.nativeElement.value,
      this.dateExpense.nativeElement.value
    ).then(result => { this.cards = this.generateCards(this.envelopes) }).catch(error => console.log(error));
      
  }

  addEnvelope(): void {

    if(this.selectCategoryAdd.nativeElement.value == "other") {
      this.api.addEnvelope(
        this.categoryAdd.nativeElement.value,
        this.amountAdd.nativeElement.value,
        this.colorAdd.nativeElement.value,
        this.setMonthNumber - 1
      ).then(result => {
        this.categories.push(result.category);
        this.envelopes.push(result.envelope);
      }).catch(error => console.log(error));
    } else {
      this.api.addEnvelope(
        this.selectCategoryAdd.nativeElement.value,
        this.amountAdd.nativeElement.value,
        this.colorAdd.nativeElement.value,
        this.setMonthNumber - 1
      ).then(result => this.envelopes.push(result.envelope)).catch(error => console.log(error));
      this.router.navigate(['/envelopes'])
    }
  }

  nameAddEnvelopes(): number {
    const field = this.categoryAdd.nativeElement;
    if (!field.disabled) {
        //var field = document.getElementById("PayeeModal");
        var regex = new RegExp("^[ A-Za-z0-9_@./#&+-: ]{1,14}$");
        //uppercase, lowercase, številke, posebni znaki, dolžina od 1-16
        if (!field.value.match(regex)) {
            field.style.setProperty("border-color", "red", "important");
            $('.tt5').toast('show');
            return 0;
        } else {
            field.style.borderColor = "#ced4da";
            $('.tt5').toast('hide')
            return 1;
        }
    } else {
        return 1;
    }
  }

  getCategories(categories) {
    var category = [];
    var j = 0;
    for (var i = 0; i < categories.length; i++) {
        if (this.uniqueCategory(category, categories[i])) {
            category[j] = categories[i];
            j++;
        }

    }

    return category;
  }

  uniqueCategory(categories, category) {
    if (categories == null) {
        return true;
    }
    for (var i = 0; i < categories.length; i++) {
        if (categories[i]._id === category._id) {
            return false;
        }
    }
    return true;
  }

  getCurrentMonth(month) {
    var monthArray = new Array();
    monthArray[0] = "JAN";
    monthArray[1] = "FEB";
    monthArray[2] = "MAR";
    monthArray[3] = "APR";
    monthArray[4] = "MAY";
    monthArray[5] = "JUN";
    monthArray[6] = "JUL";
    monthArray[7] = "AUG";
    monthArray[8] = "SEP";
    monthArray[9] = "OCT";
    monthArray[10] = 'NOV';
    monthArray[11] = 'DEC';

    return monthArray[month];
  }


  amountAddEnvelopes(): number {
    const field = this.amountAdd.nativeElement;
    var regex = new RegExp("^[0-9]+(\.[0-9]{1,2})?$");
    //decimalna števila z največj 2ma decimalnima mestoma ločilo je pika!
    //črkev male,velike,številke ne veljajo števila kot so .73, 
    if (!field.value.match(regex)) {
        field.style.setProperty("border-color", "red", "important");
        $('.tt1').toast('show')
        return 0;
    } else {
        field.style.borderColor = "#ced4da";
        $('.tt1').toast('hide')
        return 1;
    }
  }

  nameExpenseEnvelopes(): number {
    const field = this.nameExpense.nativeElement;
    var regex = new RegExp("^[ A-Za-z0-9_@./#&+-: ]{1,20}$");
    //uppercase, lowercase, številke, posebni znaki, dolžina od 1-20
    if (!field.value.match(regex)) {
        field.style.setProperty("border-color", "red", "important");
        $('.tt2').toast('show')
        return 0;
    } else {
        field.style.borderColor = "#ced4da";
        $('.tt2').toast('hide')
        return 1;
    }
  }

  amountExpenseEnvelopes() {
    const field = this.amountExpense.nativeElement;
    var regex = new RegExp("^[0-9]+(\.[0-9]{1,2})?$");
    //decimalna števila z največj 2ma decimalnima mestoma ločilo je pika!
    //črkev male,velike,številke ne veljajo števila kot so .73, 
    if (!field.value.match(regex)) {
        field.style.setProperty("border-color", "red", "important");
        $('.tt3').toast('show')
        return 0;
    } else {
        field.style.borderColor = "#ced4da";
        $('.tt3').toast('hide')
        return 1;
    }
  }

  dateExpenseEnvelopes() {
    const field = this.dateExpense.nativeElement;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    var inputDate = field.value.split("-");

    if (inputDate[0] < yyyy) {
        $('.tt4').toast('hide');
        field.style.borderColor = "#ced4da";
        return 1;
    } else if (inputDate[0] == yyyy) {
        if (inputDate[1] < mm) {
            $('.tt4').toast('hide');
            field.style.borderColor = "#ced4da";
            return 1;
        } else if (inputDate[1] == mm) {
            /* 
            ? IF DAY IS >= NOW */
            if (inputDate[2] <= dd) {
                $('.tt4').toast('hide');
                field.style.borderColor = "#ced4da";
                return 1;
            } else {
                $('.tt4').toast('show');
                field.style.setProperty("border-color", "red", "important");
                return 0;
            }
        } else {
            $('.tt4').toast('show');
            field.style.setProperty("border-color", "red", "important");
            return 0;
        }
    } else {
        $('.tt4').toast('show');
        field.style.setProperty("border-color", "red", "important");
        return 0;
    }
  }

  buttonAddEnvelopes(): void {
    var amount = this.amountAddEnvelopes();

    if (amount == 0) {
        //DO NOTHING
    } else {
      this.renderer.setAttribute(document.getElementById("buttonAddEnvelopes"), 'data-dismiss', 'modal');
      this.addEnvelope()
      this.renderer.removeAttribute(document.getElementById("buttonAddEnvelopes"), 'data-dismiss', 'modal');
    }
}

  buttonExpenseEnvelopes(): void {
    var amount = this.amountExpenseEnvelopes();
    var name = this.nameExpenseEnvelopes();
    var date = this.dateExpenseEnvelopes();


    if (amount == 0 || name == 0 || date == 0) {
        //DO NOTHING
    } else {
      this.renderer.setAttribute(document.getElementById("buttonAddExpense"), 'data-dismiss', 'modal');
      this.addExpense()
      this.renderer.removeAttribute(document.getElementById("buttonAddExpense"), 'data-dismiss', 'modal');
    }
  }

  getThisMonthEnvelopes(envelopes: Array<Envelope>): Array<Envelope> {
    var thisMonthEnvelopes: Array<Envelope> = [];
    for (let envelope of envelopes) {
      if (envelope.month === this.setMonth) {
        thisMonthEnvelopes.push(envelope);
      }
    }
    return thisMonthEnvelopes;
  }

  generateCards(envelopes) {
    const thisMonthEnvelopes = this.getThisMonthEnvelopes(envelopes);
    const almostEmptyEnvelopes = this.getAlmostEmptyEnvelopes(thisMonthEnvelopes);
    const emptyEnvelopes = this.getEmptyEnvelopes(thisMonthEnvelopes);
    

    return [
      new Card(1, 'bg-primary', 'faEnvelope', thisMonthEnvelopes.length, 'Envelopes Total', null),
      new Card(21, 'bg-warning', 'faExclamationTriangle', almostEmptyEnvelopes.length, 'Almost Empty', this.generateAlmostEmptyMessage(almostEmptyEnvelopes)),
      new Card(31, 'bg-danger', 'faRadiation', emptyEnvelopes.length, 'Empty', this.generateEmptyMessage(emptyEnvelopes)),
    ];
  }

  getAlmostEmptyEnvelopes(envelopes: Array<Envelope>): Array<Envelope> {
    var almostEmptyEnvelopes: Array<Envelope> = [];
    for (let envelope of envelopes) {
      if (envelope.progress < 100 && envelope.progress >= 85) {
        almostEmptyEnvelopes.push(envelope);
      }
    }
    return almostEmptyEnvelopes;
  }

  getEmptyEnvelopes(envelopes: Array<Envelope>): Array<Envelope> {
    var emptyEnvelopes: Array<Envelope> = [];
    for (let envelope of envelopes) {
      if (envelope.progress >= 100) {
        emptyEnvelopes.push(envelope);
      }
    }
    return emptyEnvelopes;
  }

  generateAlmostEmptyMessage(envelopes: Array<Envelope>): string {
    if (envelopes.length < 1) {
      return 'No almost empty envelopes!';
    }
    else if (envelopes.length == 1) {
      return envelopes[0].category['name'] + ' almost empty!';
    }
    else {
      return envelopes.length + ' envelopes almost empty!';
    }
  }

  generateEmptyMessage(envelopes: Array<Envelope>): string {
    if (envelopes.length < 1) {
      return 'No empty envelopes!';
    }
    else if (envelopes.length == 1) {
      return envelopes[0].category['name'] + ' empty!';
    }
    else {
      return envelopes.length + ' envelopes empty!';
    }
  }

  incrementMonth() {
    if (this.setMonthNumber == 12) this.setMonthNumber = 1;
    else this.setMonthNumber++;
    this.setMonth = this.getCurrentMonth(this.setMonthNumber - 1);
  }

  decrementMonth() {
    if (this.setMonthNumber == 1) this.setMonthNumber = 12;
    else this.setMonthNumber--;
    this.setMonth = this.getCurrentMonth(this.setMonthNumber - 1);
  }
}