from django.urls import path
from django.conf.urls.i18n import set_language

from . import views  # Make sure to import views here

urlpatterns = [
    path("login/", views.staff_login, name="staff_login"),
    path("logout/", views.staff_logout, name="staff_logout"),
    path("general/", views.general_exam_page, name="general_exam_page"),  # ✅ must match
    path('ss1_exam_result_view', views.ss1_exam_result_view, name='ss1_exam_result'),
    path('ss2_exam_result_view', views.ss2_exam_result_view, name='ss2_exam_result'),
    path('ss3_exam_result_view', views.ss3_exam_result_view, name='ss3_exam_result'),
    path('jss1_exam_result_view', views.jss1_exam_result_view, name='jss1_exam_result'),
    path('jss2_exam_result_view', views.jss2_exam_result_view, name='jss2_exam_result'),
    path('jss3_exam_result_view', views.jss3_exam_result_view, name='jss3_exam_result'),
    path('general/staff_broadsheet/', views.staff_broadsheet, name='staff_broadsheet'),
    path('about_us/', views.about_us, name='about_us'),
    path('academic_calendar/', views.academic_calendar, name='academic_calendar'),
    # path('pdf_editor_dashboard/', views.pdf_editor_dashboard, name='pdf_editor_dashboard'),

]
