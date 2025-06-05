import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emailValidator'
})
export class EmailValidatorPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
