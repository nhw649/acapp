from django.db import models
from django.contrib.auth.models import User


class Player(models.Model):
    # 关联用户表,当用户表删除时Player表也会删除
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    photo = models.URLField(max_length=256, blank=True)  # 头像图片链接

    def __str__(self):  # 展示在数据库中的名字
        return str(self.user)
