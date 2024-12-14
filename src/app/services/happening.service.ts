import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HappeningService {

  private apiUrl = '/api/happenings'; 

  constructor(private http: HttpClient) {}

  addHappening(happening: any): Observable<any> {
    return this.http.post(this.apiUrl, happening);
  }

  getHappenings(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  updateHappening(id: number, happening: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, happening);
  }

  deleteHappening(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
