# Generated by Django 2.2.7 on 2019-11-30 16:32

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Customer",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("active", "Active"),
                            ("trialing", "Trialing"),
                            ("canceled", "Canceled"),
                        ],
                        max_length=8,
                    ),
                ),
                ("unit_price", models.CharField(max_length=10)),
                ("currency", models.CharField(max_length=3)),
                ("subscription_id", models.CharField(max_length=8)),
                ("subscription_plan_id", models.CharField(max_length=8)),
                (
                    "subscription_type",
                    models.CharField(
                        choices=[
                            ("monthly", "monthly"),
                            ("sixmonths", "Six Months"),
                            ("annual", "Annual"),
                        ],
                        max_length=9,
                    ),
                ),
                ("cancel_url", models.CharField(max_length=256)),
                ("update_url", models.CharField(max_length=256)),
                ("cancelation_date", models.DateField(blank=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]
