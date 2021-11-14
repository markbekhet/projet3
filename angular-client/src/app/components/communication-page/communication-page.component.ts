import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Message, CustomDate } from '@models/MessageMeta';
import { AuthService } from '@services/authentication/auth.service';
import { SocketService } from '@services/socket/socket.service';

@Component({
  selector: 'app-communication-page',
  templateUrl: './communication-page.component.html',
  styleUrls: ['./communication-page.component.scss'],
})
export class CommunicationPageComponent implements OnInit, OnDestroy {
  username: string = '';
  messages: Message[] = [];
  messageForm: FormGroup;

  constructor(
    private activeRoute: ActivatedRoute,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private socketService: SocketService
  ) {
    this.messageForm = this.formBuilder.group({
      message: formBuilder.control('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.username = this.activeRoute.snapshot.params.username;
    this.messages = [];
    // this.chat.connect();

    this.socketService.getNewMessage().subscribe((message: Message) => {
      if (message.clientName) {
        this.messages.unshift(message);
      }
      console.log(this.messages);
      console.log(`client received: ${message.message}`);
    });
  }

  onSubmit() {
    const currentDate: Date = new Date();

    const date: CustomDate = {
      hour: currentDate.getHours().toString(),
      minutes: currentDate.getMinutes().toString(),
      seconds: currentDate.getSeconds().toString(),
    };

    const message: Message = {
      clientName: this.username,
      message: this.messageForm.value.message,
      date,
    };

    this.socketService.sendMessage(message);
    console.log(`client sent: ${message}`);

    this.messageForm.reset();
  }

  public self(clientName: string): boolean {
    return this.username === clientName;
  }

  @HostListener('window:beforeunload')
  ngOnDestroy() {
    this.messages = [];
    this.socketService.disconnect();
    this.disconnect();
  }

  disconnect(): void {
    try {
      this.auth.disconnect().subscribe(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (code) => {
          this.router.navigate(['/login']);
        }, // this.username = username
        (err) => {
          console.log(err);
        }
      ); // LandingPageComponent.usernameExists = true
    } catch (e: any) {}
    this.messages = [];
  }
}
