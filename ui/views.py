from django.shortcuts import render
from django.views.generic import View
from django.conf import settings


class Index(View):
    template_name = 'index.html'

    def get(self, request):
        user_has_access = request.user and request.user.is_authenticated() \
                          and request.user.permission_set.exists()
        return render(
            request,
            self.template_name,
            {'user_has_access': user_has_access}
        )
