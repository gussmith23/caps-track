import { describeDatabaseService } from './database.service';
import { FakeDatabaseService } from './fakeDatabase.service';

describeDatabaseService('fake database', {
  provide: 'DATABASE',
  useClass: FakeDatabaseService,
});
