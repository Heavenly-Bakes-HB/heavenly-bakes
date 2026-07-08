import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CartService } from '../../services/cart.service';

import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {

  private cartService = inject(CartService);

  private orderService = inject(OrderService);

  private router = inject(Router);

  items: any[] = [];
  message = '';
  isError = false;

  ngOnInit(): void {

    this.loadCart();

  }

  checkout(){

this.orderService.checkout().subscribe({

next:()=>{

this.message = 'Order placed successfully.';
this.isError = false;
this.router.navigate(['/orders']);

},

error:(err)=>{

console.log(err);
this.message = 'Unable to place order.';
this.isError = true;

}

});

}

  getTotal(): number {
    return this.items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  }

  loadCart() {

    this.cartService.getCart().subscribe({

      next: (res: any) => {

        this.items = res;

      },

      error: console.error

    });

  }

  changeQuantity(item: any, delta: number): void {
    const nextQty = Number(item.quantity) + delta;

    if (nextQty <= 0) {
      this.remove(item);
      return;
    }

    this.cartService.updateCart(item.id, nextQty).subscribe({
      next: () => this.loadCart()
    });
  }

  remove(item: any) {

    this.cartService.removeItem(item.id).subscribe({

      next: () => {

        this.loadCart();

      }

    });

  }

}
