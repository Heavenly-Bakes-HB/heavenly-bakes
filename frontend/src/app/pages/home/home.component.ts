import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private auth = inject(AuthService);
  private productService = inject(ProductService);

  offers = [
    {
      title: 'Weekend Special',
      text: 'Enjoy 20% off on premium cakes and pastries this weekend.'
    },
    {
      title: 'Free Delivery',
      text: 'Order above ₹999 and get free delivery in your city.'
    },
    {
      title: 'Loyalty Rewards',
      text: 'Earn points on every order and redeem exciting rewards.'
    }
  ];

  trendingProducts: any[] = [];

  highlights = [
    'Freshly baked daily',
    'Premium ingredients',
    'Fast delivery',
    'Secure payments'
  ];

  ngOnInit(): void {
    this.loadTrending();
  }

  loadTrending(): void {
    this.productService.getProducts().subscribe({
      next: (res: any) => {
        this.trendingProducts = (res || []).filter((product: any) => product.is_trending);
      }
    });
  }

  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }
}
