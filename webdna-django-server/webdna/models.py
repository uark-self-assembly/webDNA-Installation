from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
import uuid
import jwt


# Create your models here.
class User(AbstractUser):
    class Meta:
        db_table = '"webdna"."user"'

    id = models.UUIDField(primary_key=True, unique=True, default=uuid.uuid4, editable=False)


class Script(models.Model):
    class Meta:
        db_table = '"webdna"."script"'

    id = models.UUIDField(primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    file_name = models.CharField(max_length=128)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_on = models.DateTimeField(default=timezone.now)
    description = models.CharField(max_length=280, default=None, null=True)


class Project(models.Model):
    class Meta:
        db_table = '"webdna"."project"'

    id = models.UUIDField(primary_key=True, unique=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=128)
    created_on = models.DateTimeField(default=timezone.now)


class Job(models.Model):
    class Meta:
        db_table = '"webdna"."job"'

    id = models.UUIDField(primary_key=True, unique=True, default=uuid.uuid4)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    start_time = models.DateTimeField(editable=False, default=timezone.now)
    finish_time = models.DateTimeField(editable=False, default=None, null=True)
    process_name = models.CharField(max_length=128, default=None, null=True)
    terminated = models.BooleanField(default=False)
