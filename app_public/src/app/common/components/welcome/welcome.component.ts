import { Component, OnInit, Input, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common'

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  @Input()
  message: string;
  @Input()
  welcomeMessage: string;

  url: string = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
  show = localStorage.getItem(`${this.url}_welcome`);

  constructor(@Inject(DOCUMENT) private document: HTMLDocument) { }

  ngOnInit(): void {
    this.show = localStorage.getItem(`${this.url}_welcome`);
    if (this.show == 'false') {
      this.fixScreen(0);
    }
  }

  hideWelcome() {
    this.show = 'false';
    localStorage.setItem(`${this.url}_welcome`, 'false');
    this.fixScreen(1);
  }

  fixScreen(index: number) {
    var element = this.document.querySelectorAll('.container')[index];
    element.setAttribute('style', 'margin-top:15vh!important');
  }

}
