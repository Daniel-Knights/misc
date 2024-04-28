#include <stdio.h>
#include <stdlib.h>

typedef struct node {
  int number;
  struct node *next;
} node;

int main(int argc, char *argv[]) {
  node *list = NULL;

  for (int i = 1; i < argc; i++) {
    const int number = atoi(argv[i]);

    node *n = malloc(sizeof(node));
    if (n == NULL) {
      while (list) {
        node *next = list->next;

        free(list);

        list = next;
      }

      return 1;
    };

    n->number = number;
    n->next = NULL;

    if (list == NULL) {
      list = n;
    } else if (number < list->number) {
      n->next = list;
      list = n;
    } else {
      for (node *ptr = list; ptr != NULL; ptr = ptr->next) {
        if (ptr->next == NULL) {
          ptr->next = n;

          break;
        }

        if (number < ptr->next->number) {
          n->next = ptr->next;
          ptr->next = n;

          break;
        }
      }
    }
  }

  for (node *ptr = list; ptr != NULL; ptr = ptr->next) {
    printf("%i ", ptr->number);
  }

  printf("\n");

  while (list) {
    node *next = list->next;

    free(list);

    list = next;
  }
}
