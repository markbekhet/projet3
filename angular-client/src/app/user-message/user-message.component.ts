import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-message',
  templateUrl: './user-message.component.html',
  styleUrls: ['./user-message.component.scss']
})
export class UserMessageComponent implements OnInit {

  messageForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.messageForm = this.formBuilder.group({
      message: formBuilder.control('', [ Validators.required])
    });
  }

  ngOnInit(): void {
  }

  onSubmit() {
    let message = this.messageForm.value['message'];
    alert(message);

    this.messageForm.reset();
  }

}
