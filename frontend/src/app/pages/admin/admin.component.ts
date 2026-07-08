import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  private productService = inject(ProductService);
  private orderService = inject(OrderService);

  products: any[] = [];
  orders: any[] = [];
  selectedProduct: any = null;
  message = '';
  isError = false;

  productForm: any = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image_url: '',
    discount_percent: 0,
    discount_enabled: false,
    is_trending: false
  };

  ngOnInit(): void {
    this.loadProducts();
    this.loadOrders();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (res: any) => {
        this.products = res;
      },
      error: () => {
        this.products = [];
      }
    });
  }

  loadOrders(): void {
    this.orderService.getAllOrders().subscribe({
      next: (res: any) => {
        this.orders = res;
      },
      error: () => {
        this.orders = [];
      }
    });
  }

  selectProduct(product: any): void {
    this.selectedProduct = product;
    this.productForm = {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      image_url: product.image_url,
      discount_percent: product.discount_percent ?? 0,
      discount_enabled: product.discount_enabled ?? false,
      is_trending: product.is_trending ?? false
    };
  }

  resetForm(): void {
    this.selectedProduct = null;
    this.productForm = {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      image_url: '',
      discount_percent: 0,
      discount_enabled: false,
      is_trending: false
    };
  }

  saveProduct(): void {
    const payload = { ...this.productForm };

    const request = this.selectedProduct
      ? this.productService.updateProduct(this.selectedProduct.id, payload)
      : this.productService.createProduct(payload);

    request.subscribe({
      next: () => {
        this.message = this.selectedProduct ? 'Product updated successfully.' : 'Product created successfully.';
        this.isError = false;
        this.resetForm();
        this.loadProducts();
      },
      error: () => {
        this.message = 'Unable to save product. Please try again.';
        this.isError = true;
      }
    });
  }

  toggleProductActive(product: any, field: string): void {
    const payload = {
      ...product,
      discount_percent: product.discount_percent ?? 0,
      discount_enabled: product.discount_enabled ?? false,
      is_trending: product.is_trending ?? false,
      [field]: !product[field]
    };

    this.productService.updateProduct(product.id, payload).subscribe({
      next: () => {
        this.loadProducts();
      }
    });
  }

  updateOrderStatus(order: any, status: string): void {
    this.orderService.updateOrderStatus(order.id, status).subscribe({
      next: () => {
        this.message = 'Order status updated.';
        this.isError = false;
        this.loadOrders();
      },
      error: () => {
        this.message = 'Unable to update order status.';
        this.isError = true;
      }
    });
  }
}
