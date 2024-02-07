import { HttpClient, HttpEventType, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Post } from './post.model';
import { Subject, catchError, map, throwError } from 'rxjs';

@Injectable({providedIn: 'root'})
export class PostsService {
    error = new Subject<string>();

  constructor( private http: HttpClient ) {}

    createAndStorePost(title: string, content: string) {
        const postData: Post = {title: title, content: content};
        this.http
        .post<{ name: string }>(
          'https://ng-access-backend-default-rtdb.firebaseio.com/posts.json', 
          postData,
          {
            observe: 'response'
          }
          )
          .subscribe(responseData => {
            console.log(responseData);
          }, error => {
            this.error.next(error.message);
          }
          );
    }

    fetchPosts() {
        let searchParams = new HttpParams();
        searchParams = searchParams.append('print', 'pretty');
        searchParams = searchParams.append('custom', 'key');
        return this.http
          .get<{ [key: string]: Post }>('https://ng-access-backend-default-rtdb.firebaseio.com/posts.json',
            {
                headers: new HttpHeaders({'Custom-Header': 'Hello'}),
                params: searchParams,
                responseType: 'json'
            }
          )
          .pipe(
            map(responseData => { // Add type annotation for index signature
            const postsArray: Post[] = [];
            for (const key in responseData) {
              if (responseData.hasOwnProperty(key)) {
                postsArray.push({ ...responseData[key], id: key });
              }
            }
            return postsArray;
          }),
          catchError(errorRes => {
            // Send to analytics server
            return throwError(errorRes);
          })
        );
    }

    deletePost() {
        return this.http
        .delete('https://ng-access-backend-default-rtdb.firebaseio.com/posts.json',
        {
            observe: 'events',
            responseType: 'text'
        })
        .pipe(map(event => {
            console.log(event);
            if (event.type === HttpEventType.Response) {
                const response = event as HttpResponse<any>;
                console.log(response.body);
                return response;
            }
            return event; // Return the event
        }));
    }
}