from django.core.management.base import BaseCommand
from django.db.models import Count
from users.models import User


class Command(BaseCommand):
    help = 'Remove duplicate users with the same email, keeping the first/oldest one'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        # Find emails with more than one user
        duplicate_emails = (
            User.objects
            .values('email')
            .annotate(count=Count('id'))
            .filter(count__gt=1)
        )
        
        total_deleted = 0
        
        for item in duplicate_emails:
            email = item['email']
            count = item['count']
            
            # Get all users with this email, ordered by creation (keep first)
            users = User.objects.filter(email=email).order_by('id')
            
            self.stdout.write(
                self.style.WARNING(
                    f'Email "{email}" has {count} users. IDs: {[u.id for u in users]}'
                )
            )
            
            # Keep the first user, delete the rest
            to_delete = users[1:]
            
            if dry_run:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'  [DRY RUN] Would delete users: {[u.id for u in to_delete]}'
                    )
                )
            else:
                deleted_count, _ = User.objects.filter(id__in=[u.id for u in to_delete]).delete()
                self.stdout.write(
                    self.style.SUCCESS(
                        f'  Deleted {deleted_count} duplicate user(s). Keeping user ID: {users[0].id}'
                    )
                )
                total_deleted += deleted_count
        
        if not duplicate_emails.exists():
            self.stdout.write(self.style.SUCCESS('No duplicate users found!'))
        else:
            if dry_run:
                self.stdout.write(
                    self.style.WARNING(
                        f'\n[DRY RUN] Total users that would be deleted: {total_deleted}'
                    )
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(f'\nTotal users deleted: {total_deleted}')
                )
