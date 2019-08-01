import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

export interface Tab {
  title: string;
  order: number;
  hash: string;
  selected?: boolean
  removed?: boolean
}

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})

export class TabsComponent implements OnInit {

  @Input() tabs: Tab[] = [];
  @Output() eventAlteredModel = new EventEmitter();
  @Output() eventSelect = new EventEmitter();

  private onDragOrder: number;
  private dragOrder: number;

  constructor() {
  }

  ngOnInit() {
  }

  onDrop(event) {
    event.preventDefault();
    if(!this.dragOrder || !event.target.hasAttribute("order")) return;
    this.onDragOrder = event.target.getAttribute("order");

    if(this.dragOrder == this.onDragOrder) return;


    let indexFirst: number;
    let indexSecond: number;
    let tabs = this.filterModel();
    for (let index = 0; index < tabs.length; index++) {
      if (this.dragOrder == tabs[index].order) {
        indexFirst = index;
      } 
      else if (this.onDragOrder == tabs[index].order) {
        indexSecond = index;
      }
    }

    let tmpFirst = JSON.parse(JSON.stringify(tabs[indexFirst]));
    let tmpOrderSecond = tabs[indexSecond].order;
    this.tabs[indexFirst] = tabs[indexSecond];
    this.tabs[indexFirst].order = tmpFirst.order;
    this.tabs[indexSecond] = tmpFirst;
    this.tabs[indexSecond].order = tmpOrderSecond;
    this.eventAlteredModel.emit(null);
    this.dragOrder = null;
    this.onDragOrder = null;
  }
  onDragOver(event) {
    event.stopPropagation();
    event.preventDefault();
  }

  drag(event) {
    if(event.target.hasAttribute("order"))
      this.dragOrder = event.target.getAttribute("order");
  }

  addNew(title?: string) {
    this.tabs.push({ title: title || ("new - " + this.tabs.length), order: this.tabs.length, hash: this._gerarHash() });
    this.select(this.tabs[this.tabs.length-1]);
  }

  select(tab: Tab){
    for (let index = 0; index < this.tabs.length; index++) {
      this.tabs[index].selected = false;
    }
    tab.selected = true;
    this.eventSelect.emit(tab.hash);
  }

  _gerarHash(){
    let date = new Date();
    let hash = date.getDate() + date.getHours() + date.getMilliseconds() + "1";
    for (let index = 0; index < this.tabs.length; index++) {
      if(this.tabs[index].hash == hash){
        index = 0;
        hash+=date.getMilliseconds();
      }
    }
    return hash;
  }

  remove(event, tab){
    event.stopPropagation();
    if(tab.order == 1){
      let _tab = this._getTabForOrder(tab.order + 1);
      if(_tab) _tab.selected = true;
    }
    else {
      let _tab = this._getTabForOrder(tab.order - 1);
      if(_tab) _tab.selected = true;
    }
    tab.removed = true;
    tab.select = false;
    tab.order = -1;

    let sort = this.filterModel().sort((a,b) => (a.order > b.order) ? 1 : ((b.order > a.order) ? -1 : 0));
    for (let index = 0; index < sort.length; index++) {
      sort[index].order = index + 1;
      
    }
  }

  _getTabForOrder(order){
    let tabs = this.filterModel();
    for (let index = 0; index < tabs.length; index++) {
      if(tabs[index].order == order){
        return tabs[index];
      }
    }
    return null;
  }

  filterModel(){
    return this.tabs.filter(el => !el.removed);
  }
}