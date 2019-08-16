from webdna.models import User


def update_user(user_id, data):
    fetched = User.objects.all().filter(id=user_id)
    if not fetched:
        return

    fetched_user = fetched[0]

    username = data.get('username', None)
    email = data.get('email', None)
    first_name = data.get('first_name', None)
    last_name = data.get('last_name', None)

    if username is not None:
        fetched_user.username = username
    if email is not None:
        fetched_user.email = email
    if first_name is not None:
        fetched_user.first_name = first_name
    if last_name is not None:
        fetched_user.last_name = last_name

    fetched_user.save(update_fields=['username', 'email', 'first_name', 'last_name'])
    return fetched_user


