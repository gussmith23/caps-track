import { FakeDatabaseService } from './fakeDatabase.service';
import { describeDatabaseService } from './database.service.spec';

describeDatabaseService('fake database', {
  provide: 'DATABASE',
  useClass: FakeDatabaseService,
});
