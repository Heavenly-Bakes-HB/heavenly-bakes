import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private http = inject(HttpClient);

  private api = environment.apiUrl + '/cart';
  private cartItemsSubject = new BehaviorSubject<any[]>([]);
  private cartCountSubject = new BehaviorSubject<number>(0);

  cartItems$ = this.cartItemsSubject.asObservable();
  cartCount$ = this.cartCountSubject.asObservable();

  private getHeaders() {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  private updateCartState(items: any[]): void {
    const normalizedItems = Array.isArray(items) ? items : [];
    this.cartItemsSubject.next(normalizedItems);
    this.cartCountSubject.next(normalizedItems.reduce((total, item) => total + Number(item.quantity || 0), 0));
  }

  refreshCart(): void {
    this.getCart().subscribe({
      next: (res: any) => this.updateCartState(Array.isArray(res) ? res : []),
      error: () => this.updateCartState([])
    });
  }

  clearCartState(): void {
    this.updateCartState([]);
  }

  getCart(): Observable<any> {
    return this.http.get(this.api, this.getHeaders()).pipe(
      tap((res: any) => this.updateCartState(Array.isArray(res) ? res : []))
    );
  }

  addToCart(productOrId: any, quantity: number = 1): Observable<any> {
    const productId = typeof productOrId === 'object' ? productOrId.id : productOrId;

    return this.http.post(
      this.api,
      {
        product_id: productId,
        quantity
      },
      this.getHeaders()
    ).pipe(
      tap(() => this.refreshCart())
    );
  }

  updateCart(id: string, quantity: number): Observable<any> {
    return this.http.put(
      `${this.api}/${id}`,
      { quantity },
      this.getHeaders()
    ).pipe(
      tap(() => this.refreshCart())
    );
  }

  removeItem(id: string): Observable<any> {
    return this.http.delete(`${this.api}/${id}`, this.getHeaders()).pipe(
      tap(() => this.refreshCart())
    );
  }

}
