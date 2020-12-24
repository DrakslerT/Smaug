import { Component, Inject, OnInit, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common'
import { Router } from "@angular/router"
import { ApiService } from '../api.service'

@Component({
  selector: 'app-root',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class HomeComponent implements OnInit {

  constructor(private api: ApiService, private router: Router, @Inject(DOCUMENT) private document: HTMLDocument) { }

  
    @ViewChild('registration') registration: any;
  
    @ViewChild('login') login: any;

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if(window.location.href.indexOf('#registration') != -1) {
      this.registration.open()
      //document.getElementById("registration").showModal();
      console.log(this.registration)
    }

    else if(window.location.href.indexOf('#login') != -1) {
      //this.login.open()
    }
  }


  register(firstname: string, lastname: string, email1: string, email2: string, password1: string, password2: string): void {
    if (firstname && lastname && email1 && email1 === email2 && password1 && password1 === password2) {
      this.api.register(firstname, lastname, email1, email2, password1, password2, (response) => {
        
        try {
          var elementList = this.document.querySelectorAll('.modal-backdrop');
          for (let i = 0; i < elementList.length; i++) {
            elementList[i].removeAttribute('class');
          }
        }
        catch {}
        
        try {
          var elementList = this.document.querySelectorAll('.modal-open');
          for (let i = 0; i < elementList.length; i++) {
            document.removeChild(elementList[i])
          }
        }
        catch {}
        
        this.router.navigate(['/confirm', response.urlCode]);
      }, (error) => {
        console.log(error);
      });
    }
  }

  login(email: string, password: string): void {

  }
}
