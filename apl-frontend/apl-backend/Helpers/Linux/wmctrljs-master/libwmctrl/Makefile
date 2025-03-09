CC=gcc
AM_CFLAGS = -Wall -Werror
LIBS = -lX11 -lXmu

SOURCES=$(wildcard src/*.c)
TEST_SRC=$(wildcard test/*.c)
OBJS=$(SOURCES:.c=.o)
TARGET_LIB=libwmctrl.a

$(TARGET_LIB):$(OBJS)
	$(CC) $(AM_CFLAGS) -g -c $(SOURCES) $(LIBS)
	ar rcs $(TARGET_LIB) $(OBJS)

wmctrltest:$(TARGET_LIB)
	$(CC) $(AM_CFLAGS) -fsanitize=address -g -o wmctrlTest.out $(SOURCES) $(TEST_SRC) $(LIBS)
	make clean

runtest: wmctrltest
	./wmctrlTest.out
	cd .. && tsc && node ./dist/test.js

clean:
	$(RM) src/*.o
	$(RM) *.o

cleanAll: $(clean)
	$(RM) wmctrl.so
	$(RM) *.a
	$(RM) *.out