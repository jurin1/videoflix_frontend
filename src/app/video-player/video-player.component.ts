import { Component, Input, OnDestroy, ElementRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
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
export class VideoPlayerComponent implements OnDestroy, OnChanges {
  @Input() videoUrl: string = '';
  @ViewChild('target', { static: false }) target: ElementRef | undefined;
  player: any;
  @Input() showModal: boolean = false;
  private playerInitialized: boolean = false;

  constructor(private elementRef: ElementRef) { }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['videoUrl'] || changes['showModal']) && this.showModal && this.videoUrl) {
      this.disposePlayer();
      setTimeout(() => {
        this.initializePlayer();
      }, 100);
    }
  }

  private initializePlayer() {
    if (!this.target) {
      setTimeout(() => this.initializePlayer(), 50);
      return;
    }

    if (this.videoUrl) {
      this.disposePlayer();

      try {
        this.player = videojs(this.target.nativeElement, {
          controls: true,
          autoplay: true,
          muted: false,
          preload: 'auto',
          loop: false,
          fluid: true,
          aspectRatio: '16:9',
          width: 640,
          height: 360
        });

        this.player.src({
          src: this.videoUrl,
          type: 'video/mp4'
        });

        this.player.ready(() => {
          this.player.play();
        });

        this.playerInitialized = true;
      } catch (error) { }
    }
  }

  ngOnDestroy() {
    this.disposePlayer();
  }

  closeModal() {
    this.showModal = false;
    this.disposePlayer();
    this.videoUrl = '';
    this.playerInitialized = false;
  }

  private disposePlayer() {
    if (this.player) {
      this.player.dispose();
      this.player = undefined;
    }
  }
}