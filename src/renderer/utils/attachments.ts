import * as _ from 'lodash';


const Attachments = {

  sort(attachments: string[]): string[] {

    return _.sortBy(attachments, attachment => attachment.toLowerCase());

  }

};


export default Attachments;
