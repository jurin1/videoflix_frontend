import { Component, Input, AfterViewInit, OnDestroy, ElementRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import videojs from 'video.js';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal" [class.show]="showModal">
      <div class="modal-content">
        <span class="close" (click)="closeModal()">×</span>
        <video #target class="video-js vjs-default-skin" controls preload="auto" width="600" height="400">
        </video>
      </div>
    </div>
  `,
  styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent implements  OnDestroy, OnChanges {
  @Input() videoUrl: string = '';
  @ViewChild('target', { static: false }) target: ElementRef | undefined;
  player: any;
  @Input() showModal: boolean = false;
  private playerInitialized: boolean = false; // Hinzugefügt

  constructor(private elementRef: ElementRef) { } // Inject ElementRef

  ngOnChanges(changes: SimpleChanges) {
    console.log("ngOnChanges wurde aufgerufen:", changes);

    // Check if either videoUrl or showModal has changed
    if ((changes['videoUrl'] || changes['showModal']) && this.showModal && this.videoUrl) {
      // Dispose existing player first
      this.disposePlayer();

      // Then initialize the new player with a delay to ensure DOM is ready
      setTimeout(() => {
        this.initializePlayer();
      }, 100); // Increased timeout to ensure DOM is ready
    }
  }

  private initializePlayer() {
    console.log("initializePlayer wurde aufgerufen");
    if (!this.target) {
      console.warn('Video target element not found!');
      setTimeout(() => this.initializePlayer(), 50);
      return;
    }

    if (this.videoUrl) {
      // Make sure any previous instances are disposed
      this.disposePlayer();

      try {
        // Set explicit dimensions for the player
        this.player = videojs(this.target.nativeElement, {
          controls: true,
          autoplay: true,
          muted: false,
          preload: 'auto',
          loop: false,
          fluid: true,  // Make the player responsive
          aspectRatio: '16:9',  // Set aspect ratio
          width: 640,
          height: 360
        });

        this.player.src({
          src: this.videoUrl,
          type: 'video/mp4'
        });

        // Ensure player is visible and sized correctly
        this.player.ready(() => {
          this.player.play();
          console.log("Player is ready and playing");
        });

        this.playerInitialized = true;
      } catch (error) {
        console.error("Error initializing video player:", error);
      }
    } else {
      console.warn('Video URL fehlt.');
    }
  }

  ngOnDestroy() {
    this.disposePlayer();
  }

  closeModal() {
    this.showModal = false;
    this.disposePlayer();
    this.videoUrl = ''; // Video URL zurücksetzen
    this.playerInitialized = false; // Zurücksetzen
  }

  private disposePlayer() {
    if (this.player) {
      this.player.dispose();
      this.player = undefined;
    }
  }
}