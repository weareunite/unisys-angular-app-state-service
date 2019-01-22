import { Injectable } from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {HttpRequest} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UnisysAngularAppStateServiceService {

  public state = '';
  public viewState = {};
  public requestList = {
    GET: [],
    POST: [],
    DELETE: [],
    PUT: []
  };

  stateChanged = new Subject();
  requestListChanged = new Subject();
  requestListSubscription = new Subscription();
  viewStateChanged = new Subject();

  constructor(
    protected router : Router,
  ) {
    this.requestListSubscription = this.requestListChanged
      .subscribe(
        requestList => {
          setTimeout(() => {
            if (requestList['GET'].length > 0) {
              this.setState('GET');
            }else if (requestList['POST'].length > 0) {
              this.setState('POST');
            }else if (requestList['PUT'].length > 0) {
              this.setState('PUT');
            }else if (requestList['DELETE'].length > 0) {
              this.setState('DELETE');
            }
            if (requestList['GET'].length === 0 &&
              requestList['POST'].length === 0 &&
              requestList['PUT'].length === 0 &&
              requestList['DELETE'].length === 0) {
              this.setState('');
            }
          }, 200);
        }
      );
  }

  setState(state) {
    this.state = state;
    this.stateChanged.next(this.state);
  }

  updateRequestList(newList) {
    this.requestList = newList;
    this.requestListChanged.next(this.requestList);
  }

  addRequest(request: HttpRequest<any>) {
    this.requestList[request.method].push(request);
    this.updateRequestList(this.requestList);
  }

  removeRequest(request: HttpRequest<any>) {
    const  requestList = this.requestList[request.method];
    requestList.forEach(function(entry, index) {
      if (request.url === entry.url) {
        requestList.splice(index, 1);
      }
    });
    this.updateRequestList(this.requestList);
  }

// VIEW STATE

  setViewStateValue(value: any, key:string) {
    let objectPropArray       = key.split(".");
    let viewStateByUrl = this.viewState[this.router.url];
    if(objectPropArray[0] && objectPropArray[1] && objectPropArray[2] && objectPropArray[3]){
      viewStateByUrl[objectPropArray[0]][objectPropArray[1]][objectPropArray[2]][objectPropArray[3]] = value;
    } else if(objectPropArray[0] && objectPropArray[1] && objectPropArray[2]){
      viewStateByUrl[objectPropArray[0]][objectPropArray[1]][objectPropArray[2]] = value;
    }else if(objectPropArray[0] && objectPropArray[1]){
      viewStateByUrl[objectPropArray[0]][objectPropArray[1]] = value;
    }else{
      viewStateByUrl[objectPropArray[0]] = value;
    }
    this.setViewState(this.viewState[this.router.url]);
  }

  setViewState(state: any[], componentName?: string) {
    if(!this.viewState[this.router.url]){this.viewState[this.router.url] = {}};

    if(componentName){
      this.viewState[this.router.url][componentName] = state;
    }else{
      this.viewState[this.router.url] = state;
    }

    localStorage.setItem('viewState', JSON.stringify(this.viewState));
    this.viewStateChanged.next(this.viewState);
  }

  getViewState(componentName?:string){
    if(!Object.keys(this.viewState).length && localStorage.getItem('viewState')){
      this.viewState = JSON.parse(localStorage.getItem('viewState'));
    }

    if(this.viewState[this.router.url] && !componentName){
      return this.viewState[this.router.url];
    }else {
      if(this.viewState[this.router.url] && this.viewState[this.router.url][componentName]){
        return this.viewState[this.router.url][componentName];
      }
    }
    return false;
  }

  setComponentStateOrSetDefault(defaultSettings,componentName:string){
    if(!this.getViewState(componentName)){
      this.setViewState(defaultSettings,componentName);
    }
    this.viewStateChanged.next(this.viewState);
  }
}
