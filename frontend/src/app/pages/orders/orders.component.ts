import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { OrderService } from '../../services/order.service';

@Component({
selector:'app-orders',
standalone:true,
imports:[CommonModule, RouterLink],
templateUrl:'./orders.component.html',
styleUrl:'./orders.component.css'
})

export class OrdersComponent implements OnInit{

private orderService=inject(OrderService);

orders:any[]=[];

ngOnInit(){
  this.orderService.getOrders().subscribe({
    next:(res:any)=>{
      this.orders=res;
    }
  });
}

}
