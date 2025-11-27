import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface TvMazeShow {
  id: number;
  name: string;
  image?: {
    medium?: string;
    original?: string;
  };
  rating?: {
    average?: number | null;
  };
  premiered?: string | null;
}

interface TvMazeSearchResult {
  score: number;
  show: TvMazeShow;
}

interface WatchlistItem {
  serie_id: number;
  titulo_formateado: string;
  es_top: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})

export class AppComponent implements OnInit {


  letraBusqueda: string = 'a';
  resultados: TvMazeShow[] = [];
  cargando = false;
  error: string | null = null;

  private watchlistKey = 'mi_watchlist';
  watchlist: WatchlistItem[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.cargarWatchlist();
    this.buscar();
  }

  buscar(): void {
    const letra = this.letraBusqueda?.trim();
    if (!letra) {
      this.resultados = [];
      return;
    }

    this.cargando = true;
    this.error = null;

    const url = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(letra)}`;
    this.http.get<TvMazeSearchResult[]>(url).subscribe({
      next: (resp) => {
        this.resultados = resp.map(item => item.show);
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar los programas.';
        this.cargando = false;
      }
    });
  }

  private cargarWatchlist(): void {
    const data = localStorage.getItem(this.watchlistKey);
    if (data) {
      this.watchlist = JSON.parse(data);
    }
  }

  private guardarWatchlist(): void {
    localStorage.setItem(this.watchlistKey, JSON.stringify(this.watchlist));
  }

  private construirTituloFormateado(show: TvMazeShow): string {
    const nombre = (show.name || '').toUpperCase();
    let year = 'N/A';
    if (show.premiered) year = show.premiered.split('-')[0];
    return `${nombre} (${year})`;
  }

  private esTop(show: TvMazeShow): boolean {
    const rating = show.rating?.average;
    return rating != null && rating >= 8;
  }

  estaEnWatchlist(show: TvMazeShow): boolean {
    return this.watchlist.some(item => item.serie_id === show.id);
  }

  toggleWatchlist(show: TvMazeShow): void {
    const index = this.watchlist.findIndex(item => item.serie_id === show.id);

    if (index >= 0) {
      this.watchlist.splice(index, 1);
    } else {
      this.watchlist.push({
        serie_id: show.id,
        titulo_formateado: this.construirTituloFormateado(show),
        es_top: this.esTop(show)
      });
    }

    this.guardarWatchlist();
  }

  obtenerClaseTarjeta(show: TvMazeShow): string {
    const rating = show.rating?.average;
    return rating != null && rating >= 8 ? 'card card-top' : 'card card-normal';
  }

  obtenerTextoRating(show: TvMazeShow): string {
    return show.rating?.average != null
      ? show.rating.average.toFixed(1)
      : 'Sin calificar';
  }
}






