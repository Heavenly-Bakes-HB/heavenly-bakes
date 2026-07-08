import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
providedIn:'root'
})

export class AuthService{

private http=inject(HttpClient);

private api=environment.apiUrl+'/auth';

register(data:any):Observable<any>{

return this.http.post(`${this.api}/register`,data);

}

login(data:any):Observable<any>{

return this.http.post(`${this.api}/login`,data);

}

private isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

saveToken(token:string){

if(this.isBrowser()){
  window.localStorage.setItem('token',token);
}

}

saveUser(user: any): void {
  if(this.isBrowser()){
    window.localStorage.setItem('user', JSON.stringify(user));
  }
}

getUser(): any {
  if(!this.isBrowser()){
    return null;
  }

  const storedUser = window.localStorage.getItem('user');
  return storedUser ? JSON.parse(storedUser) : null;
}

getToken(): string | null {
  if (!this.isBrowser()) {
    return null;
  }

  return window.localStorage.getItem('token');
}

  isAdmin(): boolean {
    const user = this.getUser();
    return !!user && (user.role === 'ADMIN' || user.role === 'OWNER');
  }


logout(){

if(this.isBrowser()){
  window.localStorage.removeItem('token');
  window.localStorage.removeItem('user');
}

}

isLoggedIn(){

return !!this.getToken();

}

}
