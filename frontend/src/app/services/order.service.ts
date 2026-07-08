import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private http = inject(HttpClient);

  private api = environment.apiUrl + '/orders';

  private headers() {

    const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };

  }

  checkout(): Observable<any> {

    return this.http.post(
      `${this.api}/checkout`,
      {},
      this.headers()
    );

  }

  getOrders(): Observable<any> {

    return this.http.get(
      this.api,
      this.headers()
    );

  }

  getAllOrders(): Observable<any> {
    return this.http.get(
      `${environment.apiUrl}/admin/orders`,
      this.headers()
    );
  }

  updateOrderStatus(id:string, status:string): Observable<any> {
    return this.http.put(
      `${environment.apiUrl}/admin/orders/${id}/status`,
      { status },
      this.headers()
    );
  }

  getOrder(id:string):Observable<any>{

    return this.http.get(
      `${this.api}/${id}`,
      this.headers()
    );

  }

}
