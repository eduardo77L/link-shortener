import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Link } from '../../models/link.model';
import { LinksApiService } from '../../services/links-api.service';

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private readonly linksApi = inject(LinksApiService);
  private readonly fb = inject(FormBuilder);

  protected readonly links = signal<Link[]>([]);
  protected readonly loading = signal(false);
  protected readonly listLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly copiedCode = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    url: ['', [Validators.required, Validators.pattern(/^\S+\.\S+/)]],
  });

  ngOnInit(): void {
    this.loadLinks();
  }

  protected submit(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set(
        'Informe uma URL válida (ex.: google.com ou https://google.com)',
      );
      return;
    }

    this.loading.set(true);

    this.linksApi.create(this.form.getRawValue().url).subscribe({
      next: (link) => {
        this.links.update((current) => [link, ...current]);
        this.form.reset();
        this.successMessage.set('Link encurtado com sucesso.');
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.errorMessage.set(error.message);
        this.loading.set(false);
      },
    });
  }

  protected loadLinks(): void {
    this.listLoading.set(true);

    this.linksApi.findAll().subscribe({
      next: (links) => {
        this.links.set(links);
        this.listLoading.set(false);
      },
      error: (error: Error) => {
        this.errorMessage.set(error.message);
        this.listLoading.set(false);
      },
    });
  }

  protected async copyShortUrl(link: Link): Promise<void> {
    try {
      await navigator.clipboard.writeText(link.shortUrl);
      this.copiedCode.set(link.code);
      setTimeout(() => this.copiedCode.set(null), 2000);
    } catch {
      this.errorMessage.set('Não foi possível copiar para a área de transferência.');
    }
  }

  protected isInvalid(): boolean {
    const control = this.form.controls.url;
    return control.touched && control.invalid;
  }
}
