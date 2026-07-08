import { Component, inject, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {

  private productService = inject(ProductService);

  private cartService = inject(CartService);

  @ViewChild('toastAnchor') toastAnchor?: ElementRef<HTMLElement>;

  products: any[] = [];
  message = '';
  isError = false;
  showViewCartLink = false;

  ngOnInit(): void {

    this.loadProducts();

  }

  addToCart(product: any) {

  this.cartService.addToCart(product.id, 1).subscribe({

    next: () => {
      this.message = `${product.name} added to cart.`;
      this.isError = false;
      this.showViewCartLink = true;
      this.scrollToTop();
      this.hideMessageAfterDelay();
    },

    error: (err) => {
      console.error(err);
      this.message = 'Unable to add product.';
      this.isError = true;
      this.showViewCartLink = false;
      this.scrollToTop();
      this.hideMessageAfterDelay();
    }

  });

}

  private scrollToTop(): void {
    this.toastAnchor?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private hideMessageAfterDelay(): void {
    window.setTimeout(() => {
      this.message = '';
      this.showViewCartLink = false;
    }, 5000);
  }

  getProductImage(product: any): string {
    const name = (product?.name || '').toLowerCase();

    if (product?.image_url && product.image_url.startsWith('http')) {
      return product.image_url;
    }

    if (name.includes('cake')) {
      return 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=900&q=80';
    }

    if (name.includes('cookie')) {
      return 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?auto=format&fit=crop&w=900&q=80';
    }

    if (name.includes('bread') || name.includes('bun')) {
      return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80';
    }

    return 'https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?auto=format&fit=crop&w=900&q=80';
  }

  loadProducts() {

    this.productService.getProducts().subscribe({

      next: (res: any) => {

        this.products = res;

      },

      error: (err) => {

        console.log(err);

      }

    });

  }

}
