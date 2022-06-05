import java.util.Scanner;

class Main {
  public static void main(String[] args) {
    game();
  }

  static int generateTheNumber() {
    return (int)Math.floor(Math.random() * 100);
  }

  static void game() {
    Scanner myObj = new Scanner(System.in);
    String result=myObj.nextLine();
    int theNumber = generateTheNumber();
    int res = Integer.parseInt(result);

    if(res < theNumber) {
      System.out.println("Higher!");
    } else if (res > theNumber) {
      System.out.println("Lower!");
    } else {
      System.out.println("That's it!");
    }
  }
}

