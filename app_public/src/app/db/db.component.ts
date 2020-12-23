import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service'

@Component({
  selector: 'app-db',
  templateUrl: './db.component.html',
  styleUrls: ['./db.component.css']
})
export class DbComponent implements OnInit {

  constructor(private api: ApiService) { }

  ngOnInit(): void {
  }

  loadData(): void {
    this.api.loadData();
  }

  deleteData(): void {
    this.api.deleteData();
  }
}